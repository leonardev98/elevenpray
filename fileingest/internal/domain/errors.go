package domain

import "errors"

var (
	ErrNotFound       = errors.New("not found")
	ErrInvalidInput   = errors.New("invalid input")
	ErrUnsupportedMIME = errors.New("unsupported mime type")
	ErrTooLarge       = errors.New("file too large")
	ErrUpstream       = errors.New("upstream service error")
)
