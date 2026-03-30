/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * UP: untuk membuat tabel
 */
export const up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "TEXT",
      primaryKey: true,
    },
    username: {
      type: "TEXT",
      unique: true,
      notNull: true,
    },
    password: {
      type: "TEXT",
      notNull: true,
    },
  });
};

/**
 * DOWN: untuk rollback (hapus tabel)
 */
export const down = (pgm) => {
  pgm.dropTable("users");
};
