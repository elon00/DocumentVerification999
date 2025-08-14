#[test_only]
module file_hash_verifier_addr::test_end_to_end {
    use std::string;
    use std::vector;

    use file_hash_verifier_addr::file_hash_verifier;

    #[test(sender = @file_hash_verifier_addr)]
    fun test_file_hash_storage_and_verification(sender: &signer) {
        file_hash_verifier::init_module_for_test(sender);

        let file_name = string::utf8(b"test_document.pdf");
        let file_hash = x"a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890";

        // Test storing a file hash
        file_hash_verifier::store_file_hash(sender, file_name, file_hash);

        // Test that file exists
        assert!(file_hash_verifier::file_exists(file_name), 1);

        // Test getting file by name
        let file_record = file_hash_verifier::get_file_by_name(file_name);
        assert!(file_record.file_name == file_name, 2);
        assert!(file_record.file_hash == file_hash, 3);

        // Test verification with correct hash
        file_hash_verifier::verify_file_hash(sender, file_name, file_hash);

        // Test total files count
        assert!(file_hash_verifier::get_total_files() == 1, 4);

        // Test getting all files
        let all_files = file_hash_verifier::get_all_files();
        assert!(vector::length(&all_files) == 1, 5);
    }

    #[test(sender = @file_hash_verifier_addr)]
    #[expected_failure(abort_code = 1, location = file_hash_verifier_addr::file_hash_verifier)]
    fun test_verify_nonexistent_file(sender: &signer) {
        file_hash_verifier::init_module_for_test(sender);

        let file_name = string::utf8(b"nonexistent.pdf");
        let file_hash = x"a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890";

        // This should fail because the file doesn't exist
        file_hash_verifier::verify_file_hash(sender, file_name, file_hash);
    }
}
