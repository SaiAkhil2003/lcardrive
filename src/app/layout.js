import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata = {
  title: "LCarDrive",
  description: "Find trusted driving instructors across Australia."
};

function ClerkProviderBoundary({ children }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return children;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClerkProviderBoundary>{children}</ClerkProviderBoundary>
      </body>
    </html>
  );
}
