package com.savoluma.repository;

import com.savoluma.entity.Testimonial;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {
    List<Testimonial> findByStatus(String status);
}
