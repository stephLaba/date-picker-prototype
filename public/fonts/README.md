# Brand Fonts (Basetica & Tiempos Text)

To use the exact Juno brand typefaces:

1. Add your `.woff2` font files to this folder:
   - `Basetica-Medium.woff2`, `Basetica-Regular.woff2`, `Basetica-Bold.woff2`
   - `TiemposText-Regular.woff2`, `TiemposText-RegularItalic.woff2`

2. Add `@font-face` rules in `src/index.css`:

```css
@font-face {
  font-family: "Basetica";
  src: url("/fonts/Basetica-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: "Basetica";
  src: url("/fonts/Basetica-Medium.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
}
@font-face {
  font-family: "Basetica";
  src: url("/fonts/Basetica-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
}
@font-face {
  font-family: "Tiempos Text";
  src: url("/fonts/TiemposText-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: "Tiempos Text";
  src: url("/fonts/TiemposText-RegularItalic.woff2") format("woff2");
  font-weight: 400;
  font-style: italic;
}
```

Until then, the app uses **DM Sans** (Basetica fallback) and **Source Serif 4** (Tiempos fallback) from Google Fonts.
