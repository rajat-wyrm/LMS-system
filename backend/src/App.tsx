`NotificationProvider` reads `useAuth()`, so it must render *inside*
`AuthProvider` (which is currently inside `AppRouter`). Simplest change:

```tsx
import { ThemeProvider } from "@/context/ThemeContext";
import { AppRouter } from "./routes/AppRouter";

function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}

export default App;
```

becomes — wrap the router content inside `AuthProvider` in
`src/routes/AppRouter.tsx` instead, since that's where `AuthProvider` lives:

```tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
// ...existing page imports...
import { AuthProvider } from "@/store/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";

export const AppRouter = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* ...unchanged... */}
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};
```

(Only two lines change: the `NotificationProvider` import + wrapping
`<BrowserRouter>...</BrowserRouter>` with `<NotificationProvider>...</NotificationProvider>`.)