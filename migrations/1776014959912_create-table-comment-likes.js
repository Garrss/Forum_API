/* eslint-disable camelcase */
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * CREATE TABLE comment_likes
 */
export const up = (pgm) => {
  pgm.createTable('comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // Foreign key ke comments(id)
  pgm.addConstraint(
    'comment_likes',
    'fk_comment_likes.comment_id_comments.id',
    {
      foreignKeys: {
        columns: 'comment_id',
        references: 'comments(id)',
        onDelete: 'CASCADE',
      },
    },
  );

  // Foreign key ke users(id)
  pgm.addConstraint('comment_likes', 'fk_comment_likes.owner_users.id', {
    foreignKeys: {
      columns: 'owner',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  // Unique (comment_id, owner)
  pgm.addConstraint('comment_likes', 'unique_comment_likes', {
    unique: ['comment_id', 'owner'],
  });
};

/**
 * DROP TABLE comment_likes
 */
export const down = (pgm) => {
  pgm.dropTable('comment_likes');
};
