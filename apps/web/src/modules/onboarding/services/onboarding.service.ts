'use client';

export interface OnboardingState {
  completed: boolean;
  passkeyRegistrationRequired: boolean;
}

export async function completeOnboarding(
  input?: {
    displayName?: string;
  },
) {
  const response =
    await fetch(
      '/api/onboarding/complete',
      {
        method: 'POST',
        headers: {
          'content-type':
            'application/json',
        },
        body: JSON.stringify(
          input ?? {},
        ),
      },
    );

  const payload =
    await response.json();

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        'Unable to complete onboarding',
    );
  }

  return payload.data;
}