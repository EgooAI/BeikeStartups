package router

import (
	"github.com/EgooAI/BeikeStartups/handler"
	// "github.com/EgooAI/BeikeStartups/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	auth := router.Group("/api/auth")
	{
		auth.POST("/register", handler.Register)
		auth.POST("/login", handler.Login)
		auth.GET("/me", handler.GetCurrentUser)
	}

	applications := router.Group("/api/applications")
	{
		applications.POST("", handler.CreateApplication)
		applications.GET("/:id", handler.GetApplication)
		applications.PUT("/:id", handler.UpdateApplication)
		applications.DELETE("/:id", handler.DeleteApplication)
		applications.GET("", handler.ListApplications)
		applications.POST("/:id/submit", handler.SubmitApplication)
		applications.POST("/:id/approve", handler.ApproveApplication)
		applications.POST("/:id/reject", handler.RejectApplication)
	}

	teams := router.Group("/api/teams")
	{
		teams.GET("", handler.ListTeams)
		teams.GET("/:id", handler.GetTeam)
		teams.POST("", handler.CreateTeam)
		teams.PUT("/:id", handler.UpdateTeam)
		teams.DELETE("/:id", handler.DeleteTeam)
	}

	projects := router.Group("/api/projects")
	{
		projects.GET("", handler.ListProjects)
		projects.GET("/:id", handler.GetProject)
		projects.POST("", handler.CreateProject)
		projects.PUT("/:id", handler.UpdateProject)
		projects.DELETE("/:id", handler.DeleteProject)
		projects.POST("/:id/request-online", handler.RequestProjectOnline)
		projects.POST("/:id/approve-online", handler.ApproveProjectOnline)
		projects.POST("/:id/reject-online", handler.RejectProjectOnline)
		projects.POST("/:id/request-offline", handler.RequestProjectOffline)
		projects.POST("/:id/approve-offline", handler.ApproveProjectOffline)
		projects.POST("/:id/reject-offline", handler.RejectProjectOffline)
		projects.POST("/:id/invalidate", handler.InvalidateProject)
	}

	recruitments := router.Group("/api/recruitments")
	{
		recruitments.GET("", handler.ListRecruitments)
		recruitments.GET("/:id", handler.GetRecruitment)
		recruitments.POST("", handler.CreateRecruitment)
		recruitments.PUT("/:id", handler.UpdateRecruitment)
		recruitments.DELETE("/:id", handler.DeleteRecruitment)
		recruitments.POST("/:id/solve", handler.SolveRecruitment)
		recruitments.POST("/:id/invalidate", handler.InvalidateRecruitment)
	}

	responses := router.Group("/api/responses")
	{
		responses.POST("", handler.CreateResponse)
		responses.GET("/:id", handler.GetResponse)
		responses.PUT("/:id", handler.UpdateResponse)
		responses.DELETE("/:id", handler.DeleteResponse)
		responses.POST("/:id/accept", handler.AcceptResponse)
		responses.POST("/:id/reject", handler.RejectResponse)
		responses.POST("/:id/invalidate", handler.InvalidateResponse)
	}

	return router
}
