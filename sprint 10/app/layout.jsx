import "./globals.css";
import StoreProvider from "../store/StoreProvider";
import ThemeBridge from "../components/ThemeBridge";

export const metadata = {
  title: "Sprint 10 · Track A Demo",
  description: "Redux Toolkit global state demo — Sprint 10",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {/* Reads theme.mode from the store and sets data-theme on <html> */}
          <ThemeBridge />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
