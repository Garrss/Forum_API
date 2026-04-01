/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * UP: membuat tabel threads
 */
export const up = (pgm) => {
  pgm.createTable('threads', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    body: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    date: {
      type: 'TIMESTAMPTZ',
      default: pgm.func('NOW()'),
    },
  });
};

/**
 * DOWN: rollback (hapus tabel)
 */
export const down = (pgm) => {
  pgm.dropTable('threads');
};
