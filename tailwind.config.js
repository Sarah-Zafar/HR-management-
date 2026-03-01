/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    yellow: '#FFCC00',
                    green: '#2D5253',
                    black: '#1A1A1A'
                }
            }
        },
    },
    plugins: [],
}
