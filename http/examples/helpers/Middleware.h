/* Middleware to fill out content-type */
inline bool hasExt(std::string_view file, std::string_view ext) {
    if (ext.size() > file.size()) {
        return false;
    }
    return std::equal(ext.rbegin(), ext.rend(), file.rbegin());
}

/* This should be a filter / middleware like app.use(handler) */
template <bool SSL>
Ouroborus::HttpResponse<SSL> *serveFile(Ouroborus::HttpResponse<SSL> *res, Ouroborus::HttpRequest *req) {
    res->writeStatus(Ouroborus::HTTP_200_OK);

    if (hasExt(req->getUrl(), ".svg")) {
        res->writeHeader("Content-Type", "image/svg+xml");
    }

    return res;
}
