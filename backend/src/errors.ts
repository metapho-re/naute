const actionConfigurationMap = {
  format: { label: "Raw text", maxLength: 100_000 },
  generate: { label: "Prompt", maxLength: 10_000 },
};

export const TAG_PATTERN = /^[a-z0-9-]+$/;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export const validateTitle = (title: string): void => {
  if (title.trim().length === 0) {
    throw new ValidationError("Title is required.");
  }

  if (title.length > 200) {
    throw new ValidationError("Title must be 200 characters or less.");
  }
};

export const validateContent = (content: string): void => {
  if (content.length > 100 * 1024) {
    throw new ValidationError("Content must be 100KB or less.");
  }
};

export const validatePayload = (action: string, payload: string): void => {
  const actionConfiguration =
    actionConfigurationMap[action as keyof typeof actionConfigurationMap];

  if (!actionConfiguration) {
    throw new ValidationError(`Invalid action: ${action}`);
  }

  if (payload.trim().length === 0) {
    throw new ValidationError(`${actionConfiguration.label} is required.`);
  }

  if (payload.length > actionConfiguration.maxLength) {
    throw new ValidationError(
      `${actionConfiguration.label} must be ${actionConfiguration.maxLength.toLocaleString()} characters or less.`,
    );
  }
};

export const validateTags = (tags: string[]): void => {
  if (tags.length === 0) {
    throw new ValidationError("There must be at least one tag.");
  }

  if (tags.length > 20) {
    throw new ValidationError("Number of tags must be 20 or less.");
  }

  for (const tag of tags) {
    if (tag.length > 50) {
      throw new ValidationError(`Tag "${tag}" must be 50 characters or less.`);
    }

    if (!TAG_PATTERN.test(tag)) {
      throw new ValidationError(
        `Tag "${tag}" must be lowercase alphanumeric with hyphens only.`,
      );
    }
  }
};
