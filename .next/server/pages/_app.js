/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./contexts/ThemeContext.tsx":
/*!***********************************!*\
  !*** ./contexts/ThemeContext.tsx ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ThemeProvider: () => (/* binding */ ThemeProvider),\n/* harmony export */   useTheme: () => (/* binding */ useTheme)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst ThemeContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)(undefined);\nfunction ThemeProvider({ children }) {\n    const [theme, setTheme] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"dark\");\n    const [mounted, setMounted] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    // İlk yüklemede tema tercihini kontrol et\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        // Önce localStorage'dan kontrol et\n        const savedTheme = localStorage.getItem(\"theme\");\n        if (savedTheme) {\n            setTheme(savedTheme);\n        } else {\n            // Sistem tercihini kontrol et\n            const prefersDark = window.matchMedia(\"(prefers-color-scheme: dark)\").matches;\n            setTheme(prefersDark ? \"dark\" : \"light\");\n        }\n        setMounted(true);\n    }, []);\n    // Tema değiştiğinde HTML attribute'unu güncelle\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        if (mounted) {\n            document.documentElement.setAttribute(\"data-theme\", theme);\n            localStorage.setItem(\"theme\", theme);\n        }\n    }, [\n        theme,\n        mounted\n    ]);\n    const toggleTheme = ()=>{\n        const newTheme = theme === \"light\" ? \"dark\" : \"light\";\n        setTheme(newTheme);\n    };\n    // Sayfa yüklenene kadar bir şey gösterme (flash önleme)\n    if (!mounted) {\n        return null;\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(ThemeContext.Provider, {\n        value: {\n            theme,\n            toggleTheme\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"D:\\\\winsurf-ai\\\\ruya-yorumla-ai\\\\contexts\\\\ThemeContext.tsx\",\n        lineNumber: 51,\n        columnNumber: 5\n    }, this);\n}\nfunction useTheme() {\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(ThemeContext);\n    if (context === undefined) {\n        throw new Error(\"useTheme must be used within a ThemeProvider\");\n    }\n    return context;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb250ZXh0cy9UaGVtZUNvbnRleHQudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBOEU7QUFTOUUsTUFBTUssNkJBQWVKLG9EQUFhQSxDQUErQks7QUFFMUQsU0FBU0MsY0FBYyxFQUFFQyxRQUFRLEVBQWlDO0lBQ3ZFLE1BQU0sQ0FBQ0MsT0FBT0MsU0FBUyxHQUFHUCwrQ0FBUUEsQ0FBUTtJQUMxQyxNQUFNLENBQUNRLFNBQVNDLFdBQVcsR0FBR1QsK0NBQVFBLENBQUM7SUFFdkMsMENBQTBDO0lBQzFDQyxnREFBU0EsQ0FBQztRQUNSLG1DQUFtQztRQUNuQyxNQUFNUyxhQUFhQyxhQUFhQyxPQUFPLENBQUM7UUFFeEMsSUFBSUYsWUFBWTtZQUNkSCxTQUFTRztRQUNYLE9BQU87WUFDTCw4QkFBOEI7WUFDOUIsTUFBTUcsY0FBY0MsT0FBT0MsVUFBVSxDQUFDLGdDQUFnQ0MsT0FBTztZQUM3RVQsU0FBU00sY0FBYyxTQUFTO1FBQ2xDO1FBRUFKLFdBQVc7SUFDYixHQUFHLEVBQUU7SUFFTCxnREFBZ0Q7SUFDaERSLGdEQUFTQSxDQUFDO1FBQ1IsSUFBSU8sU0FBUztZQUNYUyxTQUFTQyxlQUFlLENBQUNDLFlBQVksQ0FBQyxjQUFjYjtZQUNwREssYUFBYVMsT0FBTyxDQUFDLFNBQVNkO1FBQ2hDO0lBQ0YsR0FBRztRQUFDQTtRQUFPRTtLQUFRO0lBRW5CLE1BQU1hLGNBQWM7UUFDbEIsTUFBTUMsV0FBV2hCLFVBQVUsVUFBVSxTQUFTO1FBQzlDQyxTQUFTZTtJQUNYO0lBRUEsd0RBQXdEO0lBQ3hELElBQUksQ0FBQ2QsU0FBUztRQUNaLE9BQU87SUFDVDtJQUVBLHFCQUNFLDhEQUFDTixhQUFhcUIsUUFBUTtRQUFDQyxPQUFPO1lBQUVsQjtZQUFPZTtRQUFZO2tCQUNoRGhCOzs7Ozs7QUFHUDtBQUVPLFNBQVNvQjtJQUNkLE1BQU1DLFVBQVUzQixpREFBVUEsQ0FBQ0c7SUFDM0IsSUFBSXdCLFlBQVl2QixXQUFXO1FBQ3pCLE1BQU0sSUFBSXdCLE1BQU07SUFDbEI7SUFDQSxPQUFPRDtBQUNUIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcnV5YS15b3J1bWxhLWFpLy4vY29udGV4dHMvVGhlbWVDb250ZXh0LnRzeD85MjU3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBjcmVhdGVDb250ZXh0LCB1c2VDb250ZXh0LCB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuXG50eXBlIFRoZW1lID0gJ2xpZ2h0JyB8ICdkYXJrJztcblxuaW50ZXJmYWNlIFRoZW1lQ29udGV4dFR5cGUge1xuICB0aGVtZTogVGhlbWU7XG4gIHRvZ2dsZVRoZW1lOiAoKSA9PiB2b2lkO1xufVxuXG5jb25zdCBUaGVtZUNvbnRleHQgPSBjcmVhdGVDb250ZXh0PFRoZW1lQ29udGV4dFR5cGUgfCB1bmRlZmluZWQ+KHVuZGVmaW5lZCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBUaGVtZVByb3ZpZGVyKHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlIH0pIHtcbiAgY29uc3QgW3RoZW1lLCBzZXRUaGVtZV0gPSB1c2VTdGF0ZTxUaGVtZT4oJ2RhcmsnKTtcbiAgY29uc3QgW21vdW50ZWQsIHNldE1vdW50ZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIC8vIMSwbGsgecO8a2xlbWVkZSB0ZW1hIHRlcmNpaGluaSBrb250cm9sIGV0XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgLy8gw5ZuY2UgbG9jYWxTdG9yYWdlJ2RhbiBrb250cm9sIGV0XG4gICAgY29uc3Qgc2F2ZWRUaGVtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0aGVtZScpIGFzIFRoZW1lO1xuICAgIFxuICAgIGlmIChzYXZlZFRoZW1lKSB7XG4gICAgICBzZXRUaGVtZShzYXZlZFRoZW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2lzdGVtIHRlcmNpaGluaSBrb250cm9sIGV0XG4gICAgICBjb25zdCBwcmVmZXJzRGFyayA9IHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspJykubWF0Y2hlcztcbiAgICAgIHNldFRoZW1lKHByZWZlcnNEYXJrID8gJ2RhcmsnIDogJ2xpZ2h0Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldE1vdW50ZWQodHJ1ZSk7XG4gIH0sIFtdKTtcblxuICAvLyBUZW1hIGRlxJ9pxZ90acSfaW5kZSBIVE1MIGF0dHJpYnV0ZSd1bnUgZ8O8bmNlbGxlXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1vdW50ZWQpIHtcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGhlbWUnLCB0aGVtZSk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGhlbWUnLCB0aGVtZSk7XG4gICAgfVxuICB9LCBbdGhlbWUsIG1vdW50ZWRdKTtcblxuICBjb25zdCB0b2dnbGVUaGVtZSA9ICgpID0+IHtcbiAgICBjb25zdCBuZXdUaGVtZSA9IHRoZW1lID09PSAnbGlnaHQnID8gJ2RhcmsnIDogJ2xpZ2h0JztcbiAgICBzZXRUaGVtZShuZXdUaGVtZSk7XG4gIH07XG5cbiAgLy8gU2F5ZmEgecO8a2xlbmVuZSBrYWRhciBiaXIgxZ9leSBnw7ZzdGVybWUgKGZsYXNoIMO2bmxlbWUpXG4gIGlmICghbW91bnRlZCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8VGhlbWVDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt7IHRoZW1lLCB0b2dnbGVUaGVtZSB9fT5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L1RoZW1lQ29udGV4dC5Qcm92aWRlcj5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVRoZW1lKCkge1xuICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChUaGVtZUNvbnRleHQpO1xuICBpZiAoY29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VUaGVtZSBtdXN0IGJlIHVzZWQgd2l0aGluIGEgVGhlbWVQcm92aWRlcicpO1xuICB9XG4gIHJldHVybiBjb250ZXh0O1xufVxuIl0sIm5hbWVzIjpbIlJlYWN0IiwiY3JlYXRlQ29udGV4dCIsInVzZUNvbnRleHQiLCJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsIlRoZW1lQ29udGV4dCIsInVuZGVmaW5lZCIsIlRoZW1lUHJvdmlkZXIiLCJjaGlsZHJlbiIsInRoZW1lIiwic2V0VGhlbWUiLCJtb3VudGVkIiwic2V0TW91bnRlZCIsInNhdmVkVGhlbWUiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwicHJlZmVyc0RhcmsiLCJ3aW5kb3ciLCJtYXRjaE1lZGlhIiwibWF0Y2hlcyIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwic2V0SXRlbSIsInRvZ2dsZVRoZW1lIiwibmV3VGhlbWUiLCJQcm92aWRlciIsInZhbHVlIiwidXNlVGhlbWUiLCJjb250ZXh0IiwiRXJyb3IiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./contexts/ThemeContext.tsx\n");

/***/ }),

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_font_google_target_css_path_pages_app_tsx_import_Inter_arguments_subsets_latin_display_swap_variableName_inter___WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/font/google/target.css?{\"path\":\"pages\\\\_app.tsx\",\"import\":\"Inter\",\"arguments\":[{\"subsets\":[\"latin\"],\"display\":\"swap\"}],\"variableName\":\"inter\"} */ \"./node_modules/next/font/google/target.css?{\\\"path\\\":\\\"pages\\\\\\\\_app.tsx\\\",\\\"import\\\":\\\"Inter\\\",\\\"arguments\\\":[{\\\"subsets\\\":[\\\"latin\\\"],\\\"display\\\":\\\"swap\\\"}],\\\"variableName\\\":\\\"inter\\\"}\");\n/* harmony import */ var next_font_google_target_css_path_pages_app_tsx_import_Inter_arguments_subsets_latin_display_swap_variableName_inter___WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_font_google_target_css_path_pages_app_tsx_import_Inter_arguments_subsets_latin_display_swap_variableName_inter___WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var next_i18next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-i18next */ \"next-i18next\");\n/* harmony import */ var next_i18next__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_i18next__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _contexts_ThemeContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../contexts/ThemeContext */ \"./contexts/ThemeContext.tsx\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _styles_theme_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../styles/theme.css */ \"./styles/theme.css\");\n/* harmony import */ var _styles_theme_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_styles_theme_css__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_5__);\n\n\n\n\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_5__.useRouter)();\n    const changeLanguage = (language)=>{\n        const { pathname, asPath, query } = router;\n        router.push({\n            pathname,\n            query\n        }, asPath, {\n            locale: language\n        });\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_contexts_ThemeContext__WEBPACK_IMPORTED_MODULE_2__.ThemeProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"main\", {\n            className: (next_font_google_target_css_path_pages_app_tsx_import_Inter_arguments_subsets_latin_display_swap_variableName_inter___WEBPACK_IMPORTED_MODULE_6___default().className),\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                    ...pageProps\n                }, void 0, false, {\n                    fileName: \"D:\\\\winsurf-ai\\\\ruya-yorumla-ai\\\\pages\\\\_app.tsx\",\n                    lineNumber: 25,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"fixed bottom-4 right-4 z-50\",\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"select\", {\n                        onChange: (e)=>changeLanguage(e.target.value),\n                        value: router.locale,\n                        className: \"bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500\",\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"option\", {\n                                value: \"tr\",\n                                children: \"T\\xfcrk\\xe7e\"\n                            }, void 0, false, {\n                                fileName: \"D:\\\\winsurf-ai\\\\ruya-yorumla-ai\\\\pages\\\\_app.tsx\",\n                                lineNumber: 32,\n                                columnNumber: 13\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"option\", {\n                                value: \"en\",\n                                children: \"English\"\n                            }, void 0, false, {\n                                fileName: \"D:\\\\winsurf-ai\\\\ruya-yorumla-ai\\\\pages\\\\_app.tsx\",\n                                lineNumber: 33,\n                                columnNumber: 13\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"option\", {\n                                value: \"ar\",\n                                children: \"العربية\"\n                            }, void 0, false, {\n                                fileName: \"D:\\\\winsurf-ai\\\\ruya-yorumla-ai\\\\pages\\\\_app.tsx\",\n                                lineNumber: 34,\n                                columnNumber: 13\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"option\", {\n                                value: \"de\",\n                                children: \"Deutsch\"\n                            }, void 0, false, {\n                                fileName: \"D:\\\\winsurf-ai\\\\ruya-yorumla-ai\\\\pages\\\\_app.tsx\",\n                                lineNumber: 35,\n                                columnNumber: 13\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"D:\\\\winsurf-ai\\\\ruya-yorumla-ai\\\\pages\\\\_app.tsx\",\n                        lineNumber: 27,\n                        columnNumber: 11\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"D:\\\\winsurf-ai\\\\ruya-yorumla-ai\\\\pages\\\\_app.tsx\",\n                    lineNumber: 26,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"D:\\\\winsurf-ai\\\\ruya-yorumla-ai\\\\pages\\\\_app.tsx\",\n            lineNumber: 24,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"D:\\\\winsurf-ai\\\\ruya-yorumla-ai\\\\pages\\\\_app.tsx\",\n        lineNumber: 23,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_i18next__WEBPACK_IMPORTED_MODULE_1__.appWithTranslation)(MyApp));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFRTUE7QUFQNEM7QUFDTztBQUMxQjtBQUNGO0FBRVc7QUFPeEMsU0FBU0ksTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBWTtJQUMvQyxNQUFNQyxTQUFTSixzREFBU0E7SUFFeEIsTUFBTUssaUJBQWlCLENBQUNDO1FBQ3RCLE1BQU0sRUFBRUMsUUFBUSxFQUFFQyxNQUFNLEVBQUVDLEtBQUssRUFBRSxHQUFHTDtRQUNwQ0EsT0FBT00sSUFBSSxDQUFDO1lBQUVIO1lBQVVFO1FBQU0sR0FBR0QsUUFBUTtZQUFFRyxRQUFRTDtRQUFTO0lBQzlEO0lBRUEscUJBQ0UsOERBQUNQLGlFQUFhQTtrQkFDWiw0RUFBQ2E7WUFBS0MsV0FBV2hCLHVLQUFlOzs4QkFDOUIsOERBQUNLO29CQUFXLEdBQUdDLFNBQVM7Ozs7Ozs4QkFDeEIsOERBQUNXO29CQUFJRCxXQUFVOzhCQUNiLDRFQUFDRTt3QkFDQ0MsVUFBVSxDQUFDQyxJQUFNWixlQUFlWSxFQUFFQyxNQUFNLENBQUNDLEtBQUs7d0JBQzlDQSxPQUFPZixPQUFPTyxNQUFNO3dCQUNwQkUsV0FBVTs7MENBRVYsOERBQUNPO2dDQUFPRCxPQUFNOzBDQUFLOzs7Ozs7MENBQ25CLDhEQUFDQztnQ0FBT0QsT0FBTTswQ0FBSzs7Ozs7OzBDQUNuQiw4REFBQ0M7Z0NBQU9ELE9BQU07MENBQUs7Ozs7OzswQ0FDbkIsOERBQUNDO2dDQUFPRCxPQUFNOzBDQUFLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTS9CO0FBRUEsaUVBQWVyQixnRUFBa0JBLENBQUNHLE1BQU1BLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ydXlhLXlvcnVtbGEtYWkvLi9wYWdlcy9fYXBwLnRzeD8yZmJlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEludGVyIH0gZnJvbSAnbmV4dC9mb250L2dvb2dsZSc7XG5pbXBvcnQgeyBhcHBXaXRoVHJhbnNsYXRpb24gfSBmcm9tICduZXh0LWkxOG5leHQnO1xuaW1wb3J0IHsgVGhlbWVQcm92aWRlciB9IGZyb20gJy4uL2NvbnRleHRzL1RoZW1lQ29udGV4dCc7XG5pbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWxzLmNzcyc7XG5pbXBvcnQgJy4uL3N0eWxlcy90aGVtZS5jc3MnO1xuaW1wb3J0IHR5cGUgeyBBcHBQcm9wcyB9IGZyb20gJ25leHQvYXBwJztcbmltcG9ydCB7IHVzZVJvdXRlciB9IGZyb20gJ25leHQvcm91dGVyJztcblxuY29uc3QgaW50ZXIgPSBJbnRlcih7XG4gIHN1YnNldHM6IFsnbGF0aW4nXSxcbiAgZGlzcGxheTogJ3N3YXAnLFxufSk7XG5cbmZ1bmN0aW9uIE15QXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfTogQXBwUHJvcHMpIHtcbiAgY29uc3Qgcm91dGVyID0gdXNlUm91dGVyKCk7XG5cbiAgY29uc3QgY2hhbmdlTGFuZ3VhZ2UgPSAobGFuZ3VhZ2U6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHsgcGF0aG5hbWUsIGFzUGF0aCwgcXVlcnkgfSA9IHJvdXRlcjtcbiAgICByb3V0ZXIucHVzaCh7IHBhdGhuYW1lLCBxdWVyeSB9LCBhc1BhdGgsIHsgbG9jYWxlOiBsYW5ndWFnZSB9KTtcbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxUaGVtZVByb3ZpZGVyPlxuICAgICAgPG1haW4gY2xhc3NOYW1lPXtpbnRlci5jbGFzc05hbWV9PlxuICAgICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZml4ZWQgYm90dG9tLTQgcmlnaHQtNCB6LTUwXCI+XG4gICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBjaGFuZ2VMYW5ndWFnZShlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICB2YWx1ZT17cm91dGVyLmxvY2FsZX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCByb3VuZGVkLWxnIHB4LTMgcHktMiB0ZXh0LXNtIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMFwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInRyXCI+VMO8cmvDp2U8L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJlblwiPkVuZ2xpc2g8L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJhclwiPtin2YTYudix2KjZitipPC9vcHRpb24+XG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiZGVcIj5EZXV0c2NoPC9vcHRpb24+XG4gICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9tYWluPlxuICAgIDwvVGhlbWVQcm92aWRlcj5cbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXBwV2l0aFRyYW5zbGF0aW9uKE15QXBwKTtcbiJdLCJuYW1lcyI6WyJpbnRlciIsImFwcFdpdGhUcmFuc2xhdGlvbiIsIlRoZW1lUHJvdmlkZXIiLCJ1c2VSb3V0ZXIiLCJNeUFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsInJvdXRlciIsImNoYW5nZUxhbmd1YWdlIiwibGFuZ3VhZ2UiLCJwYXRobmFtZSIsImFzUGF0aCIsInF1ZXJ5IiwicHVzaCIsImxvY2FsZSIsIm1haW4iLCJjbGFzc05hbWUiLCJkaXYiLCJzZWxlY3QiLCJvbkNoYW5nZSIsImUiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm9wdGlvbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "./styles/theme.css":
/*!**************************!*\
  !*** ./styles/theme.css ***!
  \**************************/
/***/ (() => {



/***/ }),

/***/ "next-i18next":
/*!*******************************!*\
  !*** external "next-i18next" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("next-i18next");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_app.tsx")));
module.exports = __webpack_exports__;

})();