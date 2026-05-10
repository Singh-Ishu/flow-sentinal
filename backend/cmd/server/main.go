package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Singh-Ishu/flow-sentinel/internal/db"
)

func main() {
	// Connect to database
	database, err := db.Connect("postgres://postgres:mypassword@localhost:5433/flow_sentinel?sslmode=disable")
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}
	defer database.Close()

	//Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"ok"}`)
	})

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
