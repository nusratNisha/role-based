import React from 'react';
import {
  User,
  Mail,
  Shield,
  Building2,
  FlaskConical,
  Phone,
  BadgeCheck,
  KeyRound,
  CalendarDays,
  Server,
} from 'lucide-react';


export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">
          No authenticated user found.
        </div>
      </div>
    );
  }

  const information = [
    {
      label: 'User ID',
      value: user.id,
      icon: User,
    },
    {
      label: 'Email',
      value: user.email,
      icon: Mail,
    },
    {
      label: 'Role',
      value: user.role,
      icon: Shield,
    },
    {
      label: 'Status',
      value: user.isActive ? 'Active' : 'Inactive',
      icon: BadgeCheck,
    },
    {
      label: 'First Name',
      value: user.firstName || 'N/A',
      icon: User,
    },
    {
      label: 'Last Name',
      value: user.lastName || 'N/A',
      icon: User,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2 text-base">
          Information returned from the DGHS authentication server
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center">
            <User className="w-7 h-7 text-primary-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>

            <p className="text-gray-500">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {information.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {item.label}
                  </p>

                  <p className="text-lg font-semibold text-gray-900 mt-2 break-all capitalize">
                    {item.value}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-gray-50">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Server className="w-5 h-5 text-primary-600" />

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              DGHS Account Information
            </h2>

            <p className="text-sm text-gray-500">
              Additional information from the authentication server
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
            <Building2 className="w-5 h-5 text-gray-600" />

            <div>
              <p className="text-xs font-medium text-gray-500">
                Facility ID
              </p>

              <p className="text-sm font-semibold text-gray-900 mt-1">
                N/A
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
            <FlaskConical className="w-5 h-5 text-gray-600" />

            <div>
              <p className="text-xs font-medium text-gray-500">
                Lab ID
              </p>

              <p className="text-sm font-semibold text-gray-900 mt-1">
                N/A
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
            <Phone className="w-5 h-5 text-gray-600" />

            <div>
              <p className="text-xs font-medium text-gray-500">
                Mobile
              </p>

              <p className="text-sm font-semibold text-gray-900 mt-1">
                N/A
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
            <KeyRound className="w-5 h-5 text-gray-600" />

            <div>
              <p className="text-xs font-medium text-gray-500">
                Authentication Provider
              </p>

              <p className="text-sm font-semibold text-gray-900 mt-1">
                DGHS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
            <CalendarDays className="w-5 h-5 text-gray-600" />

            <div>
              <p className="text-xs font-medium text-gray-500">
                Account Created
              </p>

              <p className="text-sm font-semibold text-gray-900 mt-1">
                Available from DGHS response
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
            <BadgeCheck className="w-5 h-5 text-gray-600" />

            <div>
              <p className="text-xs font-medium text-gray-500">
                Account Status
              </p>

              <p className="text-sm font-semibold text-green-600 mt-1">
                {user.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function useAuth(): { user: any; } {
  throw new Error('Function not implemented.');
}
