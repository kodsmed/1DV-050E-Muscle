export default function LoginForm() {
  return (
    <div className="flex min-h-full h-[calc(100vh-64px)] flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Email confirmation sent
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <div>
              <p className="block text-sm font-medium leading-6 text-gray-900">
                Please check your email.
              </p>
              <p className="block text-sm font-medium leading-6 text-gray-900 mt-4">
                A confirmation email has been sent,<br></br> once you have confirmed your email address,<br></br> you will then be directed to the login page.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}
