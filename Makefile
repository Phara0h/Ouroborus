default:
	$(MAKE) -C http
	$(CC) build.c
	./a.out || build.exe
