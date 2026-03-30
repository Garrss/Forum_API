/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * UP: membuat tabel replies
 */
export const up = (pgm) => {
  pgm.createTable("replies", {
    id: {
      type: "TEXT",
      primaryKey: true,
    },
    comment_id: {
      type: "TEXT",
      notNull: true,
      references: "comments(id)",
      onDelete: "CASCADE",
    },
    content: {
      type: "TEXT",
      notNull: true,
    },
    owner: {
      type: "TEXT",
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },
    date: {
      type: "TIMESTAMP",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
    is_delete: {
      type: "BOOLEAN",
      default: false,
    },
  });
};

/**
 * DOWN: rollback (hapus tabel)
 */
export const down = (pgm) => {
  pgm.dropTable("replies");
};
