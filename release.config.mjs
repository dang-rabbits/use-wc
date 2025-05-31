export default {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'master',
    { name: 'main', channel: 'pre', prerelease: true },
    'next',
    'next-major',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ],
};
