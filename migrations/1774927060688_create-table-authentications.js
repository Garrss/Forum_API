/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * UP: membuat tabel authentications
 */
export const up = (pgm) => {
  pgm.createTable('authentications', {
    token: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

/**
 * DOWN: rollback (hapus tabel)
 */
export const down = (pgm) => {
  pgm.dropTable('authentications');
};
