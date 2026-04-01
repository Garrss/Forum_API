/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * UP: membuat tabel comments
 */
export const up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    // eslint-disable-next-line camelcase
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'threads(id)',
      onDelete: 'CASCADE',
    },
    content: {
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
    // eslint-disable-next-line camelcase
    is_delete: {
      type: 'BOOLEAN',
      default: false,
    },
  });
};

/**
 * DOWN: rollback (hapus tabel)
 */
export const down = (pgm) => {
  pgm.dropTable('comments');
};
