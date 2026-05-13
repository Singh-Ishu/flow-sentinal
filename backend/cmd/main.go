package main

import "log"

func main() {
	router := rest.SetupRoutes(nil, nil, nil)
	log.Fatal(router.Run(":8080"))
}
