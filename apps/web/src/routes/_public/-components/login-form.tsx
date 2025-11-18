import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import * as v from 'valibot';
import { authClient } from '@/clients/authClient';
import FormFieldInfo from '@/routes/-components/common/form-field-info';
import Spinner from '@/routes/-components/common/spinner';
import { AuthLayout } from './auth-layout';

const FormSchema = v.object({
  email: v.pipe(v.string(), v.email('Please enter a valid email address')),
  password: v.pipe(
    v.string(),
    v.minLength(8, 'Password must be at least 8 characters'),
  ),
});

export default function LoginCredentialsForm() {
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: FormSchema,
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signIn.email(
        {
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
            <AuthLayout.Title>Log in to your account</AuthLayout.Title>
            <AuthLayout.Description>
              Please enter your credentials to continue.
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
                name="email"
                children={(field) => {
                  return (
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
                  );
                }}
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
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? <Spinner /> : 'Log in'}
                </Button>
              )}
            />
          </form>
          <AuthLayout.FormFooter>
            <p className="text-xs">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-primary underline font-semibold"
              >
                Sign up
              </Link>
            </p>
          </AuthLayout.FormFooter>
        </AuthLayout.FormContent>
      </AuthLayout.FormContainer>
      <AuthLayout.SubContainer>
        <AuthLayout.SubTitle
          title="Welcome Back!"
          subTitle="We're glad to see you again."
          subDesc="Please enter your credentials to continue."
        />
        <AuthLayout.SubImage
          src="/images/login-illustration.png"
          alt="Login Illustration"
        />
      </AuthLayout.SubContainer>
    </AuthLayout.Root>
  );
}
