import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    typography: {
        fontFamily: '"Poppins", sans-serif',
        button: {
            textTransform: "none",
        },
    },
    palette: {
        primary: {
            main: "#fde047",
        },
        background: {
            default: "#1B1C21",
            paper: "#27272a",
        },
        text: {
            primary: "#ffffff",
            secondary: "#e5e7eb",
        },
    },
});

export default theme;
