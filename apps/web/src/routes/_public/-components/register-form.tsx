import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import * as v from 'valibot';
import { AuthLayout } from './auth-layout';
import { authClient } from '@/clients/authClient';
import FormFieldInfo from '@/routes/-components/common/form-field-info';
import Spinner from '@/routes/-components/common/spinner';

const FormSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.minLength(2, 'Name must be at least 2 characters'),
    ),
    email: v.pipe(v.string(), v.email('Please enter a valid email address')),
    password: v.pipe(
      v.string(),
      v.minLength(8, 'Password must be at least 8 characters'),
    ),
    confirmPassword: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['confirmPassword']],
      (input) => input.password === input.confirmPassword,
      'The two passwords do not match.',
    ),
    ['confirmPassword'],
  ),
);

export default function RegisterCredentialsForm() {
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onChange: FormSchema,
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signUp.email(
        {
          name: value.name,
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({ to: '/' });
          },
        },
      );
      if (error) {
        toast.error(error.message ?? JSON.stringify(error));
      }
    },
  });

  return (
    <AuthLayout.Root>
      <AuthLayout.FormContainer>
        <AuthLayout.FormContent>
          <AuthLayout.FormHeader>
            <AuthLayout.Title>Create your account</AuthLayout.Title>
            <AuthLayout.Description>
              Please fill in the details below to get started.
            </AuthLayout.Description>
          </AuthLayout.FormHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div>
              <form.Field
                name="name"
                children={(field) => (
                  <>
                    <Input
                      id={field.name}
                      type="text"
                      placeholder="Full Name"
                      aria-invalid={
                        field.state.meta.errors.length ? 'true' : 'false'
                      }
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FormFieldInfo field={field} />
                  </>
                )}
              />
            </div>
            <div>
              <form.Field
                name="email"
                children={(field) => (
                  <>
                    <Input
                      id={field.name}
                      type="email"
                      placeholder="Email"
                      aria-invalid={
                        field.state.meta.errors.length ? 'true' : 'false'
                      }
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FormFieldInfo field={field} />
                  </>
                )}
              />
            </div>
            <div>
              <form.Field
                name="password"
                children={(field) => (
                  <>
                    <div className="flex justify-end items-center relative w-full">
                      <Input
                        id={field.name}
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder="Password"
                        name={field.name}
                        aria-invalid={
                          field.state.meta.errors.length ? 'true' : 'false'
                        }
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <Button
                        className="absolute mr-2 w-7 h-7 rounded-full"
                        type="button"
                        tabIndex={-1}
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsPasswordVisible(!isPasswordVisible);
                        }}
                      >
                        {isPasswordVisible ? <EyeOpenIcon /> : <EyeNoneIcon />}
                      </Button>
                    </div>
                    <FormFieldInfo field={field} />
                  </>
                )}
              />
            </div>
            <div>
              <form.Field
                name="confirmPassword"
                children={(field) => (
                  <>
                    <div className="flex justify-end items-center relative w-full">
                      <Input
                        id={field.name}
                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        name={field.name}
                        aria-invalid={
                          field.state.meta.errors.length ? 'true' : 'false'
                        }
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <Button
                        className="absolute mr-2 w-7 h-7 rounded-full"
                        type="button"
                        tabIndex={-1}
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsConfirmPasswordVisible(
                            !isConfirmPasswordVisible,
                          );
                        }}
                      >
                        {isConfirmPasswordVisible ? (
                          <EyeOpenIcon />
                        ) : (
                          <EyeNoneIcon />
                        )}
                      </Button>
                    </div>
                    <FormFieldInfo field={field} />
                  </>
                )}
              />
            </div>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? <Spinner /> : 'Register'}
                </Button>
              )}
            />
          </form>
          <AuthLayout.FormFooter>
            <p className="text-xs">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary underline font-semibold"
              >
                Log in
              </Link>
            </p>
          </AuthLayout.FormFooter>
        </AuthLayout.FormContent>
      </AuthLayout.FormContainer>
      <AuthLayout.SubContainer>
        <AuthLayout.SubTitle
          title="Join Us!"
          subTitle="Welcome to our community."
          subDesc="Please fill in the details below to get started."
        />
        <AuthLayout.SubImage
          src="/images/register-illustration.png"
          alt="Register Illustration"
        />
      </AuthLayout.SubContainer>
    </AuthLayout.Root>
  );
}
