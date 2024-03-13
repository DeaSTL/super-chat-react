package utils

import (
	"encoding/base64"
	"fmt"
	"math/rand"
)

func GenB64(length int) string {
	dembytes := make([]byte, length)
	_, err := rand.Read(dembytes)
	if err != nil {
		return ""
	}
	encoded := base64.URLEncoding.EncodeToString(dembytes)
	return encoded
}

func HSVToRGB(h, s, v float64) (r, g, b uint8) {
	var i int
	var f, p, q, t float64

	if s == 0 {
		// Achromatic (grey)
		r = uint8(v * 255)
		g = uint8(v * 255)
		b = uint8(v * 255)
		return
	}

	h /= 60 // sector 0 to 5
	i = int(h)
	f = h - float64(i) // factorial part of h
	p = v * (1 - s)
	q = v * (1 - s*f)
	t = v * (1 - s*(1-f))

	switch i {
	case 0:
		r = uint8(v * 255)
		g = uint8(t * 255)
		b = uint8(p * 255)
	case 1:
		r = uint8(q * 255)
		g = uint8(v * 255)
		b = uint8(p * 255)
	case 2:
		r = uint8(p * 255)
		g = uint8(v * 255)
		b = uint8(t * 255)
	case 3:
		r = uint8(p * 255)
		g = uint8(q * 255)
		b = uint8(v * 255)
	case 4:
		r = uint8(t * 255)
		g = uint8(p * 255)
		b = uint8(v * 255)
	default: // case 5:
		r = uint8(v * 255)
		g = uint8(p * 255)
		b = uint8(q * 255)
	}
	return
}

func GenerateRandomHexColor() string {
	hue := rand.Float64() * 360 // Random hue between 0 and 360
	saturation := 1.0           // Max saturation
	brightness := 1.0           // Max brightness

	r, g, b := HSVToRGB(hue, saturation, brightness)
	return fmt.Sprintf("#%02X%02X%02X", r, g, b)
}
