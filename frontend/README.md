# React + TypeScript + Vite

# Befehle für DATABASE

# Erstele Migration

npx tsx node_modules/typeorm/cli.js migration:generate -d src/backend/ormconfig.ts src/backend/migrations/CreateRemarkTable

# Migration ausführen.

npx typeorm migration:run -d src/backend/ormconfig.ts

# Frontend

Für Tailwind:

- npx tailwindcss -i ./src/input.css -o ./src/output.css --watch

dashboard

├─ .gitignore
├─ .prettierrc
├─ .vscode
│ ├─ launch.json
│ └─ settings.json
├─ generate-migration.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│ ├─ images
│ │ ├─ background1.jpg
│ │ ├─ background2.jpg
│ │ ├─ background3.jpg
│ │ ├─ background4.jpg
│ │ └─ background5.jpg
│ └─ logo.svg
├─ README.md
├─ src
│ ├─ assets
│ │ ├─ background-dark.jpg
│ │ ├─ background-light.jpg
│ │ └─ react.svg
│ ├─ backend
│ │ ├─ application
│ │ │ ├─ middlewares
│ │ │ │ └─ authMiddleware.ts
│ │ │ └─ server.ts
│ │ ├─ domain
│ │ │ ├─ models
│ │ │ │ ├─ LayoutConfig.ts
│ │ │ │ ├─ User.ts
│ │ │ │ └─ Widget.ts
│ │ │ ├─ repositories
│ │ │ │ ├─ AuthRepository.ts
│ │ │ │ ├─ ILayoutConfigRepository.ts
│ │ │ │ ├─ IUserRepository.ts
│ │ │ │ └─ IWidgetRepository.ts
│ │ │ └─ services
│ │ │ ├─ AuthService.ts
│ │ │ ├─ LayoutConfigService.ts
│ │ │ ├─ UserService.ts
│ │ │ └─ WidgetService.ts
│ │ └─ infrastructure
│ │ ├─ adapter
│ │ │ ├─ input
│ │ │ │ └─ controllers
│ │ │ │ ├─ helper.ts
│ │ │ │ ├─ LayoutConfigController.ts
│ │ │ │ ├─ UserController.ts
│ │ │ │ └─ WidgetController.ts
│ │ │ └─ output
│ │ │ └─ GoogleAuthAdapter.ts
│ │ ├─ database
│ │ │ ├─ LayoutConfigModel.ts
│ │ │ ├─ mongoose.ts
│ │ │ ├─ UserModel.ts
│ │ │ └─ WidgetModel.ts
│ │ ├─ repositories
│ │ │ ├─ LayoutConfigRepository.ts
│ │ │ ├─ UserRepository.ts
│ │ │ └─ WidgetRepository.ts
│ │ ├─ routes
│ │ │ ├─ authRoutes.ts
│ │ │ ├─ layoutConfigRoutes.ts
│ │ │ ├─ userRoutes.ts
│ │ │ └─ widgetRoutes.ts
│ │ └─ setup
│ │ ├─ layoutConfigInitializer.ts
│ │ └─ widgetInitializer.ts
│ ├─ config
│ │ └─ generalVariables.ts
│ ├─ frontend
│ │ ├─ adapter
│ │ │ ├─ api
│ │ │ │ ├─ GoogleCalendarAdapter.ts
│ │ │ │ ├─ LayoutConfigAdapter.ts
│ │ │ │ └─ WidgetsAdapter.ts
│ │ │ ├─ auth
│ │ │ │ └─ authAdapter.ts
│ │ │ └─ ui
│ │ │ ├─ components
│ │ │ │ ├─ navLayout
│ │ │ │ │ ├─ NavLayout.styled.ts
│ │ │ │ │ └─ NavLayout.tsx
│ │ │ │ ├─ ProtectedRoute
│ │ │ │ │ └─ ProtectedRoute.tsx
│ │ │ │ └─ themeSwitcher
│ │ │ │ └─ themeSwitcher.tsx
│ │ │ ├─ contexts
│ │ │ │ └─ AuthContext.tsx
│ │ │ ├─ hooks
│ │ │ │ ├─ configSite
│ │ │ │ │ └─ useGoogleCalendarAuth.ts
│ │ │ │ ├─ layoutConfig
│ │ │ │ │ ├─ useGetLayoutConfig.ts
│ │ │ │ │ └─ useUpdateLayoutConfig.ts
│ │ │ │ ├─ dashboardSite
│ │ │ │ │ ├─ useCalendarEvents.ts
│ │ │ │ │ ├─ useNext5DaysWeather.ts
│ │ │ │ │ └─ useWeatherData.ts
│ │ │ │ └─ widgets
│ │ │ │ ├─ useGetWidget.ts
│ │ │ │ ├─ useGetWidgetList.ts
│ │ │ │ └─ useUpdateWidget.ts
│ │ │ ├─ i18n
│ │ │ │ ├─ i18n.ts
│ │ │ │ └─ languages
│ │ │ │ ├─ ar.json
│ │ │ │ ├─ de.json
│ │ │ │ └─ en.json
│ │ │ ├─ sites
│ │ │ │ ├─ config
│ │ │ │ │ ├─ components
│ │ │ │ │ │ ├─ EditWidgetModal
│ │ │ │ │ │ │ └─ EditWidgetModal.tsx
│ │ │ │ │ │ ├─ EventsEdit
│ │ │ │ │ │ │ └─ EventsEdit.tsx
│ │ │ │ │ │ ├─ LayoutConfig
│ │ │ │ │ │ │ └─ LayoutConfig.tsx
│ │ │ │ │ │ ├─ RemarksEdit
│ │ │ │ │ │ │ └─ RemarksEdit.tsx
│ │ │ │ │ │ ├─ WeatherEdit
│ │ │ │ │ │ │ └─ WeatherEdit.tsx
│ │ │ │ │ │ └─ WidgetList
│ │ │ │ │ │ ├─ Widget.tsx
│ │ │ │ │ │ ├─ WidgetList.tsx
│ │ │ │ │ │ └─ WidgetListSkeletons.tsx
│ │ │ │ │ ├─ Config.tsx
│ │ │ │ │ └─ ConfigHelper.ts
│ │ │ │ ├─ Home
│ │ │ │ │ └─ Home.tsx
│ │ │ │ ├─ NotFound
│ │ │ │ │ └─ NotFound.tsx
│ │ │ │ ├─ Price
│ │ │ │ │ └─ Price.tsx
│ │ │ │ ├─ Test
│ │ │ │ │ └─ test.tsx
│ │ │ │ └─ dashboard
│ │ │ │ ├─ App.css
│ │ │ │ ├─ App.scss
│ │ │ │ ├─ components
│ │ │ │ │ ├─ Background
│ │ │ │ │ │ └─ Background.tsx
│ │ │ │ │ ├─ BrightnessWrapper
│ │ │ │ │ │ └─ BrightnessWrapper.tsx
│ │ │ │ │ ├─ Calendar
│ │ │ │ │ │ ├─ Calendar.tsx
│ │ │ │ │ │ ├─ CalendarEventItem.tsx
│ │ │ │ │ │ ├─ helper.ts
│ │ │ │ │ │ ├─ NotConfiguredMessage.tsx
│ │ │ │ │ │ └─ style.ts
│ │ │ │ │ ├─ DateInfo
│ │ │ │ │ │ └─ DateInfo.tsx
│ │ │ │ │ ├─ DateTimeWidget
│ │ │ │ │ │ └─ DateTimeWidget.tsx
│ │ │ │ │ ├─ helper.ts
│ │ │ │ │ ├─ LoadingSpinner
│ │ │ │ │ │ └─ LoadingSpinner.tsx
│ │ │ │ │ ├─ MenuSection
│ │ │ │ │ │ └─ MenuSection.tsx
│ │ │ │ │ ├─ News
│ │ │ │ │ │ ├─ helper.ts
│ │ │ │ │ │ └─ News.tsx
│ │ │ │ │ ├─ Notification
│ │ │ │ │ │ ├─ Notification.tsx
│ │ │ │ │ │ └─ style.ts
│ │ │ │ │ ├─ PinDigit
│ │ │ │ │ │ ├─ Pin.tsx
│ │ │ │ │ │ └─ PinDigit.tsx
│ │ │ │ │ ├─ RemarksWidget
│ │ │ │ │ │ └─ RemarksWidget.tsx
│ │ │ │ │ ├─ ResturantsWidget
│ │ │ │ │ │ └─ Resturants.tsx
│ │ │ │ │ ├─ ScrollableComponent
│ │ │ │ │ │ └─ ScrollableComponent.tsx
│ │ │ │ │ ├─ Time
│ │ │ │ │ │ └─ Time.tsx
│ │ │ │ │ ├─ ToolsWidget
│ │ │ │ │ │ └─ ToolsWidget.tsx
│ │ │ │ │ ├─ UserStatusButton
│ │ │ │ │ │ └─ UserStatusButton.tsx
│ │ │ │ │ ├─ WeatherWidget
│ │ │ │ │ │ ├─ helper.ts
│ │ │ │ │ │ ├─ Weather.tsx
│ │ │ │ │ │ └─ WeatherSnap.tsx
│ │ │ │ │ └─ Widgets
│ │ │ │ │ └─ Widgets.tsx
│ │ │ │ ├─ helper.ts
│ │ │ │ └─ LiveBoard.tsx
│ │ │ └─ types
│ │ │ └─ weather
│ │ │ ├─ DailyWeatherApiResponse.ts
│ │ │ ├─ WeatherDay.ts
│ │ │ └─ WeatherType.ts
│ │ ├─ application
│ │ │ ├─ repositories
│ │ │ │ ├─ authRepository.ts
│ │ │ │ ├─ layoutConfigRepository.ts
│ │ │ │ └─ widgetRepository.ts
│ │ │ └─ useCases
│ │ │ ├─ fetchGoogleCalendarEvents
│ │ │ │ ├─ dtos
│ │ │ │ │ └─ SimpleGoogleEventDto.ts
│ │ │ │ ├─ FetchGoogleCalendarEventsUseCase.ts
│ │ │ │ ├─ index.ts
│ │ │ │ └─ ports
│ │ │ │ ├─ input.ts
│ │ │ │ └─ outputs.ts
│ │ │ ├─ fetchGoogleUserCalendars
│ │ │ │ ├─ dtos
│ │ │ │ │ ├─ GoogleCalendarDto.ts
│ │ │ │ │ └─ GoogleCalendarListDto.ts
│ │ │ │ ├─ FetchGoogleUserCalendarsUseCase.ts
│ │ │ │ ├─ index.ts
│ │ │ │ └─ ports
│ │ │ │ ├─ input.ts
│ │ │ │ └─ outputs.ts
│ │ │ ├─ fetchGoogleUserInfoForCalendar
│ │ │ │ ├─ dtos
│ │ │ │ │ └─ userProfileDto.ts
│ │ │ │ ├─ FetchGoogleUserInfoForCalendarUseCase.ts
│ │ │ │ ├─ index.ts
│ │ │ │ └─ ports
│ │ │ │ ├─ input.ts
│ │ │ │ └─ outputs.ts
│ │ │ ├─ getGoogleTokens
│ │ │ │ ├─ GetGoogleTokensUseCase.ts
│ │ │ │ ├─ index.ts
│ │ │ │ └─ ports
│ │ │ │ ├─ input.ts
│ │ │ │ └─ outputs.ts
│ │ │ ├─ index.ts
│ │ │ ├─ loginForGoogleCalendar
│ │ │ │ ├─ dtos
│ │ │ │ │ └─ TokenCalenderDto.ts
│ │ │ │ ├─ index.ts
│ │ │ │ ├─ LoginForGoogleCalendarUseCase.ts
│ │ │ │ └─ ports
│ │ │ │ ├─ input.ts
│ │ │ │ └─ outputs.ts
│ │ │ ├─ refreshGoogleAccessToken
│ │ │ │ ├─ index.ts
│ │ │ │ ├─ ports
│ │ │ │ │ ├─ input.ts
│ │ │ │ │ └─ outputs.ts
│ │ │ │ └─ refreshGoogleAccessTokenUseCase.ts
│ │ │ ├─ removeGoogleTokens
│ │ │ │ ├─ index.ts
│ │ │ │ ├─ ports
│ │ │ │ │ ├─ input.ts
│ │ │ │ │ └─ outputs.ts
│ │ │ │ └─ RemoveGoogleTokensUseCase.ts
│ │ │ └─ setGoogleTokens
│ │ │ ├─ index.ts
│ │ │ ├─ ports
│ │ │ │ ├─ input.ts
│ │ │ │ └─ outputs.ts
│ │ │ └─ SetGoogleTokensUseCase.ts
│ │ └─ common
│ │ ├─ constants.ts
│ │ ├─ di.ts
│ │ ├─ helpers
│ │ │ └─ objectHelper.ts
│ │ └─ routes.ts
│ ├─ index.css
│ ├─ input.css
│ ├─ main.tsx
│ ├─ output.css
│ ├─ root.tsx
│ ├─ shared
│ │ ├─ domain
│ │ │ ├─ iLayoutConfig.ts
│ │ │ ├─ iuser.ts
│ │ │ ├─ iwidget.ts
│ │ │ └─ widgetSettings.ts
│ │ └─ dtos
│ │ └─ ipatchableProp.ts
│ └─ vite-env.d.ts
├─ tailwind.config.js
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
