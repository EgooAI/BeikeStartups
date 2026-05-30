package handler

import (
	"github.com/EgooAI/BeikeStartups/database"
	"github.com/EgooAI/BeikeStartups/model"
	"github.com/EgooAI/BeikeStartups/response"
	"github.com/gin-gonic/gin"
)

type CreateBannerRequest struct {
	Title    string `json:"title" binding:"required,max=200"`
	ImageURL string `json:"image_url" binding:"required,max=500"`
	LinkURL  string `json:"link_url" max:"500"`
	Status   string `json:"status" binding:"omitempty,oneof=active inactive"`
}

type UpdateBannerRequest struct {
	Title    *string `json:"title"`
	ImageURL *string `json:"image_url"`
	LinkURL  *string `json:"link_url"`
	Status   *string `json:"status"`
}

func ListBanners(c *gin.Context) {
	var banners []model.Banner
	query := database.DB

	if err := query.Where("status = ?", model.BannerStatusActive).
		Order("id DESC").
		Find(&banners).Error; err != nil {
		response.InternalError(c, "获取轮播图列表失败")
		return
	}

	response.Success(c, banners)
}

func ListAllBanners(c *gin.Context) {
	var banners []model.Banner
	if err := database.DB.Order("sort_order ASC, id DESC").Find(&banners).Error; err != nil {
		response.InternalError(c, "获取轮播图列表失败")
		return
	}
	response.Success(c, banners)
}

func GetBanner(c *gin.Context) {
	id := c.Param("id")
	var banner model.Banner
	if err := database.DB.First(&banner, id).Error; err != nil {
		response.NotFound(c, "轮播图不存在")
		return
	}
	response.Success(c, banner)
}

func CreateBanner(c *gin.Context) {
	var req CreateBannerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	status := model.BannerStatusActive
	if req.Status != "" {
		status = model.BannerStatus(req.Status)
	}

	banner := model.Banner{
		Title:    req.Title,
		ImageURL: req.ImageURL,
		LinkURL:  req.LinkURL,
		Status:   status,
	}

	if err := database.DB.Create(&banner).Error; err != nil {
		response.InternalError(c, "创建轮播图失败")
		return
	}

	response.Success(c, banner)
}

func UpdateBanner(c *gin.Context) {
	id := c.Param("id")
	var banner model.Banner
	if err := database.DB.First(&banner, id).Error; err != nil {
		response.NotFound(c, "轮播图不存在")
		return
	}

	var req UpdateBannerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	if req.Title != nil {
		banner.Title = *req.Title
	}
	if req.ImageURL != nil {
		banner.ImageURL = *req.ImageURL
	}
	if req.LinkURL != nil {
		banner.LinkURL = *req.LinkURL
	}
	if req.Status != nil {
		banner.Status = model.BannerStatus(*req.Status)
	}

	if err := database.DB.Save(&banner).Error; err != nil {
		response.InternalError(c, "更新轮播图失败")
		return
	}

	response.Success(c, banner)
}

func DeleteBanner(c *gin.Context) {
	id := c.Param("id")
	var banner model.Banner
	if err := database.DB.First(&banner, id).Error; err != nil {
		response.NotFound(c, "轮播图不存在")
		return
	}

	if err := database.DB.Unscoped().Delete(&banner).Error; err != nil {
		response.InternalError(c, "删除轮播图失败")
		return
	}

	response.Success(c, gin.H{"message": "删除成功"})
}
