package middleware

import (
	"strings"

	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/response"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID   uint           `json:"user_id"`
	Username string         `json:"username"`
	Role     model.UserRole `json:"role"`
	jwt.RegisteredClaims
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Set("user", nil)
			c.Next()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			response.Unauthorized(c, "无效的认证格式")
			c.Abort()
			return
		}

		token := parts[1]
		claims, err := ParseToken(token)
		if err != nil {
			response.Unauthorized(c, "无效的令牌")
			c.Abort()
			return
		}

		var user model.User
		if err := database.DB.First(&user, claims.UserID).Error; err != nil {
			response.Unauthorized(c, "用户不存在")
			c.Abort()
			return
		}

		c.Set("user", &user)
		c.Set("claims", claims)
		c.Next()
	}
}

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		user := c.MustGet("user").(*model.User)
		if user == nil {
			response.Unauthorized(c, "需要登录")
			c.Abort()
			return
		}
		c.Next()
	}
}

func RequireRole(roles ...model.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := c.MustGet("user").(*model.User)
		if user == nil {
			response.Unauthorized(c, "需要登录")
			c.Abort()
			return
		}

		for _, role := range roles {
			if user.Role == role {
				c.Next()
				return
			}
		}

		response.Forbidden(c, "权限不足")
		c.Abort()
	}
}

func RequireTeamOwner() gin.HandlerFunc {
	return func(c *gin.Context) {
		user := c.MustGet("user").(*model.User)
		if user == nil {
			response.Unauthorized(c, "需要登录")
			c.Abort()
			return
		}

		var team model.Team
		teamID := c.Param("id")
		if err := database.DB.First(&team, teamID).Error; err != nil {
			response.NotFound(c, "团队不存在")
			c.Abort()
			return
		}

		if team.OwnerID != user.ID && user.Role != model.RoleAdmin {
			response.Forbidden(c, "只有团队所有者或管理员可以执行此操作")
			c.Abort()
			return
		}

		c.Next()
	}
}
