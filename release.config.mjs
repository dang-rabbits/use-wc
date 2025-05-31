export default {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
    { name: 'pre', prerelease: true },
    { name: 'rc', prerelease: true },
  ],
};
