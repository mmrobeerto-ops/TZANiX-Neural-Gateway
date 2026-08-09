import "./globals.css";

export const metadata = {
  title: "TZANiX Data Solutions - Portal",
  description: "Motor de Purificación IA | FastAPI Core. Purificación de flujos de datos a alta velocidad.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="grid-bg"></div>
        <div className="gold-glow-orb"></div>
        {children}
      </body>
    </html>
  );
}
