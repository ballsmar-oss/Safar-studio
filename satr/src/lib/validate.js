export const isSaudiMobile = (c) =>
  /^(05\d{8}|9665\d{8}|\+9665\d{8})$/.test(c.replace(/[\s-]/g, ""));
