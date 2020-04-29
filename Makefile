default:
	$(shell git clone -b v0.3.5 "https://github.com/uNetworking/uSockets.git" http/uSockets)
	$(CC) build.c
	./a.out || build.exe
