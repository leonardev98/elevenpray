package domain

import "errors"

var (
	ErrNotFound        = errors.New("not found")
	ErrInvalidInput    = errors.New("invalid input")
	ErrUnsupportedMIME = errors.New("unsupported mime type")
	ErrTooLarge        = errors.New("file too large")
	ErrUpstream        = errors.New("upstream service error")
)

// IsUnsupportedMIME reports whether err is ErrUnsupportedMIME.
func IsUnsupportedMIME(err error) bool {
	return errors.Is(err, ErrUnsupportedMIME)
}

// IsTooLarge reports whether err is ErrTooLarge.
func IsTooLarge(err error) bool {
	return errors.Is(err, ErrTooLarge)
}
