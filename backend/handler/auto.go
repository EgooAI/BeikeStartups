package handler

import (
	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/middleware"
	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/response"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Nickname string `json:"nickname"`
	Phone    string `json:"phone"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	var existingUser model.User
	if err := database.DB.Where("username = ? OR email = ?", req.Username, req.Email).First(&existingUser).Error; err == nil {
		response.BadRequest(c, "用户名或邮箱已存在")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		response.InternalError(c, "密码加密失败")
		return
	}

	user := model.User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashedPassword),
		Nickname: req.Nickname,
		Phone:    req.Phone,
		Role:     model.RoleStudent,
		IsActive: true,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		response.InternalError(c, "注册失败")
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		response.InternalError(c, "生成令牌失败")
		return
	}

	response.Success(c, gin.H{
		"user":  user,
		"token": token,
	})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	var user model.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		response.Unauthorized(c, "用户名或密码错误")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		response.Unauthorized(c, "用户名或密码错误")
		return
	}

	if !user.IsActive {
		response.Forbidden(c, "账户已被禁用")
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		response.InternalError(c, "生成令牌失败")
		return
	}

	response.Success(c, gin.H{
		"user":  user,
		"token": token,
	})
}

func GetCurrentUser(c *gin.Context) {
	user := c.MustGet("user").(*model.User)
	response.Success(c, user)
}
