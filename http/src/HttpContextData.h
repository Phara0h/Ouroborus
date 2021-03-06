/*
 * Copyright 2020 Phara0h
 * Changes are the diff from uWebSockets.js v17.4.0 (commit 116a85f9668dcb03e7799db06dc8275bc43c0963)
 * to this file.
 *
 * Authored by Alex Hultman, 2018-2019.
 * Intellectual property of third-party.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#ifndef OUROBORUS_HTTPCONTEXTDATA_H
#define OUROBORUS_HTTPCONTEXTDATA_H

#include "HttpRouter.h"

#include <vector>
#include "f2/function2.hpp"

namespace Ouroborus {
template<bool> struct HttpResponse;
struct HttpRequest;

template <bool SSL>
struct alignas(16) HttpContextData {
    template <bool> friend struct HttpContext;
    template <bool> friend struct HttpResponse;
private:
    std::vector<fu2::unique_function<void(HttpResponse<SSL> *, int)>> filterHandlers;

    struct RouterData {
        HttpResponse<SSL> *httpResponse;
        HttpRequest *httpRequest;
    };

    HttpRouter<RouterData> router;
};

}

#endif // OUROBORUS_HTTPCONTEXTDATA_H
