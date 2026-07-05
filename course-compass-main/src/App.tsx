import { ThemeProvider } from "@/context/ThemeContext";
import { AppRouter } from "@/routes/AppRouter";

const App = () => {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
};

export default App;
