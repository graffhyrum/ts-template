# Testing File System Operations in init.ts

## Recommendation: Integration Testing with Temporary Directories

### Chosen Strategy

**Integration Testing with Temporary Directories** is the best approach for testing file system operations in `init.ts`.

### Why This Approach?

1. **Bun's native APIs are hard to mock**: `Bun.write()` and `Bun.file()` are Bun-specific APIs without straightforward mocking solutions
2. **Pure template generators**: These functions have no business logic - they simply write files to disk
3. **More reliable**: Testing against real filesystem ensures actual behavior works correctly
4. **Fast and safe**: Using Node's `mkdtemp()` creates isolated temp directories that are automatically cleaned up
5. **Better coverage**: Tests verify that files are actually created with correct content

### Implementation Details

#### 1. Export Functions for Testing
Modified `src/commands/init.ts` to export functions:
- `InitConfig` interface
- `checkInitialized()`
- `writeFile()`
- `generateBasicTemplate()`
- `generateApiTemplate()`

#### 2. Use Temporary Directories
Each test creates a unique temp directory using `fs.mkdtempSync()`:
```typescript
beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(process.env.TMPDIR || "/tmp", "init-test-"));
});
```

#### 3. Mock process.exit()
Functions call `process.exit(1)` on errors. Mock this to prevent test termination:
```typescript
beforeEach(() => {
  exitCode = null;
  exitCalled = false;
  originalExit = process.exit;
  process.exit = ((code: number) => {
    exitCalled = true;
    exitCode = code;
    throw new Error(`process.exit(${code}) called`);
  }) as (code?: number) => never;
});

afterEach(() => {
  process.exit = originalExit;
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
```

#### 4. Test File Operations
Verify files are created with correct content:
```typescript
test("generateBasicTemplate creates all expected files", async () => {
  const config: InitConfig = {
    name: "test-project",
    template: "basic",
    entryPoint: "src/index.ts",
    targetDir: tempDir,
  };

  await generateBasicTemplate(config);

  expect(fs.existsSync(path.join(tempDir, "package.json"))).toBeTrue();
  expect(fs.existsSync(path.join(tempDir, "tsconfig.json"))).toBeTrue();
});
```

#### 5. Test Error Conditions
Verify error handling works correctly:
```typescript
test("validateFilePermissions fails with non-existent directory", () => {
  const nonExistentDir = path.join(tempDir, "does-not-exist");
  
  expect(() => validateFilePermissions(nonExistentDir)).toThrow(
    "process.exit(1) called",
  );
  expect(exitCalled).toBeTrue();
  expect(exitCode).toBe(1);
});
```

### Test Coverage Results

**Before:** ~14% coverage for `init.ts`

**After:** 86.67% function coverage, 64.68% line coverage

### Key Tests Implemented

1. `writeFile` creates file with correct content
2. `writeFile` creates nested directories
3. `writeFile` handles errors gracefully
4. `generateBasicTemplate` creates all expected files
5. `generateBasicTemplate` creates valid package.json
6. `generateBasicTemplate` uses custom entry point
7. `generateApiTemplate` creates all expected files
8. `validateFilePermissions` succeeds with writable directory
9. `validateFilePermissions` fails with non-existent directory
10. `checkInitialized` fails when package.json exists
11. `checkInitialized` succeeds when package.json does not exist

### Why Not Mocking?

**Mocking disadvantages:**
- Bun's native APIs (`Bun.write()`, `Bun.file()`) don't have straightforward mocking
- Mocking requires maintaining mock implementations in sync with real API
- Tests might pass but actual code could fail (mocked behavior != real behavior)
- Doesn't catch real filesystem issues (permissions, disk space, etc.)

**Integration testing advantages:**
- Tests actual behavior, not mocked behavior
- Catches filesystem-related issues early
- No need to maintain mock implementations
- Simpler test setup
- More confidence in production behavior

### Best Practices Applied

1. **Isolation**: Each test uses a fresh temp directory
2. **Cleanup**: Temp directories are removed after each test
3. **Error handling**: Mock `process.exit()` to test error paths
4. **Verification**: Check both file existence AND content
5. **Coverage**: Test both success and failure scenarios
6. **Type safety**: Use proper TypeScript types for parsed JSON

### Running the Tests

```bash
# Run all integration tests
bun test src/commands/init.integration.test.ts

# Run all tests with coverage
bun run test

# Run full validation
bun run fastvet
```

### Files Modified/Created

- **Modified**: `src/commands/init.ts` - Exported functions for testing
- **Created**: `src/commands/init.integration.test.ts` - Integration test suite

### Next Steps

1. **Increase coverage**: Test the remaining lines (especially `runInstall()` and the main `init()` function)
2. **Add E2E tests**: Test the complete CLI flow
3. **Snapshot testing**: Consider using snapshots for generated file contents
4. **Performance tests**: Test with large file sets if needed

### Conclusion

Integration testing with temporary directories is the superior approach for `init.ts` because:
- It tests real behavior
- It's simpler to implement
- It provides better confidence in production
- It works seamlessly with Bun's native APIs
- It provides significantly better test coverage
