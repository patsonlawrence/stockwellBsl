export const metadata = {
  title: "Stockwell BSL",
  description: "PWA Login App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body
        style={{
          margin: 0,
          padding: 0,
          height: "100%",
          overflow: "hidden", // prevent scrollbars
        }}
      >
        {children}
      </body>
    </html>
  );
}
