// app/layout.jsx
import "./globals.css";
import Providers from "./providers"; 

export const metadata = {
  title: "Artha Admin",
  description: "Job Importer Admin Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
