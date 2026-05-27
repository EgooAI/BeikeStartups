package middleware

import (
	"errors"
	"time"

	"github.com/EgooAI/BeikeStartups/config"
	"github.com/EgooAI/BeikeStartups/model"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret []byte

func init() {
	cfg := config.Load()
	jwtSecret = []byte(cfg.JWTSecret)
}

func GenerateToken(userID uint, username string, role model.UserRole) (string, error) {
	_ = Claims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"role":     role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})

	return token.SignedString(jwtSecret)
}

func ParseToken(tokenString string) (*Claims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return &Claims{
		UserID:   uint(claims["user_id"].(float64)),
		Username: claims["username"].(string),
		Role:     model.UserRole(claims["role"].(string)),
	}, nil
}
