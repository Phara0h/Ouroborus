/* This is a fuzz test of the http parser */

#define WIN32_EXPORT

#include "helpers.h"

/* We test the websocket parser */
#include "../src/HttpParser.h"

/* And the router */
#include "../src/HttpRouter.h"

struct StaticData {

    struct RouterData {

    };

    Ouroborus::HttpRouter<RouterData> router;

    StaticData() {

        router.add({"get"}, "/:hello/:hi", [](auto *h) mutable {
            auto [paramsTop, params] = h->getParameters();

            /* Something is horribly wrong */
            if (paramsTop != 1 || !params[0].length() || !params[1].length()) {
                exit(-1);
            }

            /* This route did handle it */
            return true;
        });

        router.add({"post"}, "/:hello/:hi/*", [](auto *h) mutable {
            auto [paramsTop, params] = h->getParameters();

            /* Something is horribly wrong */
            if (paramsTop != 1 || !params[0].length() || !params[1].length()) {
                exit(-1);
            }

            /* This route did handle it */
            return true;
        });

        router.add({"get"}, "/*", [](auto *h) mutable {
            auto [paramsTop, params] = h->getParameters();

            /* Something is horribly wrong */
            if (paramsTop != -1) {
                exit(-1);
            }

            /* This route did not handle it */
            return false;
        });

        router.add({"get"}, "/hi", [](auto *h) mutable {
            auto [paramsTop, params] = h->getParameters();

            /* Something is horribly wrong */
            if (paramsTop != -1) {
                exit(-1);
            }

            /* This route did handle it */
            return true;
        });
    }
} staticData;

extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    /* Create parser */
    Ouroborus::HttpParser httpParser;
    /* User data */
    void *user = (void *) 13;

    /* Iterate the padded fuzz as chunks */
    makeChunked(makePadded(data, size), size, [&httpParser, user](const uint8_t *data, size_t size) {
        /* We need at least 1 byte post padding */
        if (size) {
            size--;
        } else {
            /* We might be given zero length chunks */
            return;
        }
        
        /* Parse it */
        httpParser.consumePostPadded((char *) data, size, user, [](void *s, Ouroborus::HttpRequest *httpRequest) -> void * {

            readBytes(httpRequest->getHeader(httpRequest->getUrl()));
            readBytes(httpRequest->getMethod());
            readBytes(httpRequest->getQuery());

            /* Route the method and URL in two passes */
            staticData.router.getUserData() = {};
            if (!staticData.router.route(httpRequest->getMethod(), httpRequest->getUrl())) {
                /* It was not handled */
                return nullptr;
            }

            for (auto p : *httpRequest) {

            }

            /* Return ok */
            return s;

        }, [](void *user, std::string_view data, bool fin) -> void * {

            /* Return ok */
            return user;

        }, [](void *user) {

            /* Return break */
            return nullptr;
        });
    });

    return 0;
}

