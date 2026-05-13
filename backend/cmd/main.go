package main

import (
	"log"

	"github.com/Singh-Ishu/flow-sentinel/backend/internal/api/rest"
)

func main() {
	router := rest.SetupRoutes(nil, nil, nil)
	log.Fatal(router.Run(":8080"))
}
