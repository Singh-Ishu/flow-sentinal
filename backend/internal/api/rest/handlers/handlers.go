package handlers

import (
	"net/http"

	"flow-sentinel/internal/service"
	"flow-sentinel/internal/websocket"
	"github.com/gin-gonic/gin"
)

// Auth
func Login(s *service.UserService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func Logout() gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func GetCurrentUser() gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }

// Telemetry
func GetLatestTelemetry(s *service.TelemetryService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func IngestTelemetry(s *service.TelemetryService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func GetTelemetryHistory(s *service.TelemetryService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }

// Alerts
func GetAlerts(s *service.AlertService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func GetAlert(s *service.AlertService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func AcknowledgeAlert(s *service.AlertService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func ResolveAlert(s *service.AlertService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }

// Tasks
func GetTasks(s *service.TaskService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func CreateTask(s *service.TaskService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func GetTask(s *service.TaskService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func UpdateTask(s *service.TaskService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func DeleteTask(s *service.TaskService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }

// Users
func GetUsers(s *service.UserService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func CreateUser(s *service.UserService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func GetUser(s *service.UserService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func UpdateUser(s *service.UserService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
func DeleteUser(s *service.UserService) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }

// WebSocket
func WebSocketUpgrade(h *websocket.Hub) gin.HandlerFunc { return func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{}) } }
