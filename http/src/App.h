/*
 * Authored by Phara0h, 2020.
 *
 * Authored by Alex Hultman, 2018-2019.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#ifndef OUROBORUS_APP_H
#define OUROBORUS_APP_H

/* An app is a convenience wrapper of some of the most used fuctionalities and allows a
 * builder-pattern kind of init. Apps operate on the implicit thread local Loop */

#include "HttpContext.h"
#include "HttpResponse.h"
#include "PerMessageDeflate.h"

namespace Ouroborus {

template <bool SSL>
struct TemplatedApp {
private:
    /* The app always owns at least one http context, but creates websocket contexts on demand */
    HttpContext<SSL> *httpContext;

public:

    /* Attaches a "filter" function to track socket connections/disconnections */
    void filter(fu2::unique_function<void(HttpResponse<SSL> *, int)> &&filterHandler) {
        httpContext->filter(std::move(filterHandler));
    }


    ~TemplatedApp() {
        /* Let's just put everything here */
        if (httpContext) {
            httpContext->free();
        }
    }

    /* Disallow copying, only move */
    TemplatedApp(const TemplatedApp &other) = delete;

    TemplatedApp(TemplatedApp &&other) {
        /* Move HttpContext */
        httpContext = other.httpContext;
        other.httpContext = nullptr;
    }

    TemplatedApp(us_socket_context_options_t options = {}) {
        httpContext = Ouroborus::HttpContext<SSL>::create(Ouroborus::Loop::get(), options);
    }

    bool constructorFailed() {
        return !httpContext;
    }

    TemplatedApp &&get(std::string pattern, fu2::unique_function<void(HttpResponse<SSL> *, HttpRequest *)> &&handler) {
        if (httpContext) {
            httpContext->onHttp("get", pattern, std::move(handler));
        }
        return std::move(*this);
    }

    TemplatedApp &&post(std::string pattern, fu2::unique_function<void(HttpResponse<SSL> *, HttpRequest *)> &&handler) {
        if (httpContext) {
            httpContext->onHttp("post", pattern, std::move(handler));
        }
        return std::move(*this);
    }

    TemplatedApp &&options(std::string pattern, fu2::unique_function<void(HttpResponse<SSL> *, HttpRequest *)> &&handler) {
        if (httpContext) {
            httpContext->onHttp("options", pattern, std::move(handler));
        }
        return std::move(*this);
    }

    TemplatedApp &&del(std::string pattern, fu2::unique_function<void(HttpResponse<SSL> *, HttpRequest *)> &&handler) {
        if (httpContext) {
            httpContext->onHttp("delete", pattern, std::move(handler));
        }
        return std::move(*this);
    }

    TemplatedApp &&patch(std::string pattern, fu2::unique_function<void(HttpResponse<SSL> *, HttpRequest *)> &&handler) {
        if (httpContext) {
            httpContext->onHttp("patch", pattern, std::move(handler));
        }
        return std::move(*this);
    }

    TemplatedApp &&put(std::string pattern, fu2::unique_function<void(HttpResponse<SSL> *, HttpRequest *)> &&handler) {
        if (httpContext) {
            httpContext->onHttp("put", pattern, std::move(handler));
        }
        return std::move(*this);
    }

    TemplatedApp &&head(std::string pattern, fu2::unique_function<void(HttpResponse<SSL> *, HttpRequest *)> &&handler) {
        if (httpContext) {
            httpContext->onHttp("head", pattern, std::move(handler));
        }
        return std::move(*this);
    }

    TemplatedApp &&connect(std::string pattern, fu2::unique_function<void(HttpResponse<SSL> *, HttpRequest *)> &&handler) {
        if (httpContext) {
            httpContext->onHttp("connect", pattern, std::move(handler));
        }
        return std::move(*this);
    }

    TemplatedApp &&trace(std::string pattern, fu2::unique_function<void(HttpResponse<SSL> *, HttpRequest *)> &&handler) {
        if (httpContext) {
            httpContext->onHttp("trace", pattern, std::move(handler));
        }
        return std::move(*this);
    }

    /* This one catches any method */
    TemplatedApp &&any(std::string pattern, fu2::unique_function<void(HttpResponse<SSL> *, HttpRequest *)> &&handler) {
        if (httpContext) {
            httpContext->onHttp("*", pattern, std::move(handler));
        }
        return std::move(*this);
    }

    /* Host, port, callback */
    TemplatedApp &&listen(std::string host, int port, fu2::unique_function<void(us_listen_socket_t *)> &&handler) {
        if (!host.length()) {
            return listen(port, std::move(handler));
        }
        handler(httpContext ? httpContext->listen(host.c_str(), port, 0) : nullptr);
        return std::move(*this);
    }

    /* Host, port, options, callback */
    TemplatedApp &&listen(std::string host, int port, int options, fu2::unique_function<void(us_listen_socket_t *)> &&handler) {
        if (!host.length()) {
            return listen(port, options, std::move(handler));
        }
        handler(httpContext ? httpContext->listen(host.c_str(), port, options) : nullptr);
        return std::move(*this);
    }

    /* Port, callback */
    TemplatedApp &&listen(int port, fu2::unique_function<void(us_listen_socket_t *)> &&handler) {
        handler(httpContext ? httpContext->listen(nullptr, port, 0) : nullptr);
        return std::move(*this);
    }

    /* Port, options, callback */
    TemplatedApp &&listen(int port, int options, fu2::unique_function<void(us_listen_socket_t *)> &&handler) {
        handler(httpContext ? httpContext->listen(nullptr, port, options) : nullptr);
        return std::move(*this);
    }

    TemplatedApp &&run() {
        Ouroborus::run();
        return std::move(*this);
    }

};

typedef TemplatedApp<false> App;
typedef TemplatedApp<true> SSLApp;

}

#endif // OUROBORUS_APP_H
