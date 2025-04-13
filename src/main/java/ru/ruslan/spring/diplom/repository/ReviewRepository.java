package ru.ruslan.spring.diplom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ruslan.spring.diplom.model.Review;
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
}
