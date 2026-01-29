import initApp from "./index";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

initApp()
  .then((app) => {
    //
    app.listen(PORT, () => {
      //
    });
  })
  .catch((err) => {
    //
    process.exit(1);
  });
