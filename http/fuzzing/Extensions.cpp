/* This is a fuzz test of the websocket extensions parser */

#define WIN32_EXPORT

#include <cstdio>
#include <string>

/* We test the websocket extensions parser */
#include "../src/WebSocketExtensions.h"

extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {

    {
        Ouroborus::ExtensionsNegotiator<true> extensionsNegotiator(Ouroborus::Options::PERMESSAGE_DEFLATE);
        extensionsNegotiator.readOffer({(char *) data, size});

        extensionsNegotiator.generateOffer();
        extensionsNegotiator.getNegotiatedOptions();
    }

    {
        Ouroborus::ExtensionsNegotiator<true> extensionsNegotiator(Ouroborus::Options::NO_OPTIONS);
        extensionsNegotiator.readOffer({(char *) data, size});

        extensionsNegotiator.generateOffer();
        extensionsNegotiator.getNegotiatedOptions();
    }

    {
        Ouroborus::ExtensionsNegotiator<true> extensionsNegotiator(Ouroborus::Options::CLIENT_NO_CONTEXT_TAKEOVER);
        extensionsNegotiator.readOffer({(char *) data, size});

        extensionsNegotiator.generateOffer();
        extensionsNegotiator.getNegotiatedOptions();
    }

    return 0;
}

