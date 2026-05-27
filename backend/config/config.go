package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port       string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	CORSOrigin string
	AppEnv     string
}

var App *Config

func Load() *Config {
	if App != nil {
		return App
	}

	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	App = &Config{
		Port:       getEnv("PORT", "8080"),
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "password"),
		DBName:     getEnv("DB_NAME", "beike_startups"),
		JWTSecret:  getEnv("JWT_SECRET", "beike-startups-secret-key-change-in-production"),
		CORSOrigin: getEnv("CORS_ORIGIN", "http://localhost:3000"),
		AppEnv:     getEnv("APP_ENV", "development"),
	}

	return App
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
