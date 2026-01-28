import initApp from "./index";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

initApp()
  .then((app) => {
    console.log("App initialized");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize app", err);
    process.exit(1);
  });
