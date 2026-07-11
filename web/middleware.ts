import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const path = req.nextUrl.pathname;
      if (path.startsWith("/start") || path.startsWith("/dashboard") || path.startsWith("/history")) {
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/start/:path*", "/dashboard/:path*", "/history/:path*"],
};
