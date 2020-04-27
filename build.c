#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>

/* List of platform features */
#ifdef _WIN32
#define OS "win32"
#define IS_WINDOWS
#endif
#ifdef __linux
#define OS "linux"
#define IS_LINUX
#endif
#ifdef __APPLE__
#define OS "darwin"
#define IS_MACOS
#endif

/* System, but with string replace */
int run(const char *cmd, ...) {
    char buf[512];
    va_list args;
    va_start(args, cmd);
    vsprintf(buf, cmd, args);
    va_end(args);
    printf("--> %s\n\n", buf);
    return system(buf);
}

/* List of Node.js versions */
struct node_version {
    char *name;
    char *abi;
} versions[] = {
    {"v10.17.0", "64"},
    {"v11.15.0", "67"},
    {"v12.13.0", "72"},
    {"v13.1.0", "79"},
    {"v14.0.0", "83"}
};

/* Downloads headers, creates folders */
void prepare() {
    if (run("mkdir dist") || run("mkdir targets")) {
        return;
    }

    /* For all versions */
    for (unsigned int i = 0; i < sizeof(versions) / sizeof(struct node_version); i++) {
        run("curl -OJ https://nodejs.org/dist/%s/node-%s-headers.tar.gz", versions[i].name, versions[i].name);
        run("tar xzf node-%s-headers.tar.gz -C targets", versions[i].name);
        run("curl https://nodejs.org/dist/%s/win-x64/node.lib > targets/node-%s/node.lib", versions[i].name, versions[i].name);
    }
}

/* Build for Unix systems */
void build(char *compiler, char *cpp_compiler, char *cpp_linker, char *os, char *arch) {
    char *c_shared = "-DLIBUS_USE_LIBUV -DLIBUS_USE_OPENSSL -flto -O3 -c -fPIC -I http/uSockets/src http/uSockets/src/*.c http/uSockets/src/eventing/*.c http/uSockets/src/crypto/*.c";
    char *cpp_shared = "-DLIBUS_USE_LIBUV -DLIBUS_USE_OPENSSL -flto -O3 -c -fPIC -std=c++17 -I http/uSockets/src -I http/src src/addon.cpp";

    for (unsigned int i = 0; i < sizeof(versions) / sizeof(struct node_version); i++) {
        run("%s %s -I targets/node-%s/include/node", compiler, c_shared, versions[i].name);
        run("%s %s -I targets/node-%s/include/node", cpp_compiler, cpp_shared, versions[i].name);
        run("%s %s %s -o dist/Ouroborus_%s_%s_%s.node", cpp_compiler, "-flto -O3 *.o -std=c++17 -shared", cpp_linker, os, arch, versions[i].abi);
    }
}

void copy_files() {
#ifdef IS_WINDOWS
    run("copy \"src\\Ouroborus.js\" dist /Y");
    run("copy \"package.json\" dist /Y");
#else
    run("cp src/Ouroborus.js dist/Ouroborus.js");
    run("cp package.json dist/package.json");
#endif
}

/* Special case for windows */
void build_windows(char *arch) {
    /* For all versions */
    for (unsigned int i = 0; i < sizeof(versions) / sizeof(struct node_version); i++) {
        run("cl /W3 /D \"LIBUS_USE_LIBUV\" /D \"LIBUS_USE_OPENSSL\" /std:c++17 /I http/uSockets/src http/uSockets/src/*.c "
            "http/uSockets/src/eventing/*.c http/uSockets/src/crypto/*.c /I targets/node-%s/include/node /I http/src /EHsc "
            "/Ox /LD /Fedist/Ouroborus_win32_%s_%s.node src/addon.cpp targets/node-%s/node.lib",
            versions[i].name, arch, versions[i].abi, versions[i].name);
    }
}

int main() {
    printf("[Preparing]\n");
    prepare();
    printf("\n[Building]\n");

#ifdef IS_WINDOWS
    build_windows("x64");
#else
#ifdef IS_MACOS
    /* Apple special case */
    build("clang -mmacosx-version-min=10.7",
          "clang++ -stdlib=libc++ -mmacosx-version-min=10.7",
          "-undefined dynamic_lookup",
          OS,
          "x64");
#else
    /* Linux */
    build("clang",
          "clang++",
          "-static-libstdc++ -static-libgcc -s",
          OS,
          "x64");

    /* If linux we also want arm64 */
    build("aarch64-linux-gnu-gcc", "aarch64-linux-gnu-g++", "-static-libstdc++ -static-libgcc -s", OS, "arm64");
#endif
#endif

    copy_files();
}
